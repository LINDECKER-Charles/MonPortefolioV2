use std::{
    fs::{File, OpenOptions},
    io::Read,
    net::SocketAddr,
    path::Path,
    sync::Arc,
};

use portfolio_backend::{AppState, config::Config, mail::SmtpDelivery, routes, storage::Store};

fn main() {
    if let Err(error) = start() {
        // Les erreurs de configuration ne contiennent ni valeurs ni secrets.
        eprintln!("Impossible de démarrer le backend : {error}");
        std::process::exit(1);
    }
}

fn start() -> Result<(), String> {
    if std::env::args().nth(1).as_deref() == Some("--hash-password") {
        let mut password = String::new();
        std::io::stdin()
            .take(1_026)
            .read_to_string(&mut password)
            .map_err(|_| "Impossible de lire le mot de passe sur l’entrée standard".to_owned())?;
        let password = password.trim_end_matches(['\r', '\n']);
        println!("{}", portfolio_backend::admin::hash_password(password)?);
        return Ok(());
    }
    if std::env::args().nth(1).as_deref() == Some("--reset-2fa") {
        let config = Config::from_env()?;
        let _database_lock = lock_database(&config.database_path)?;
        let bootstrap_email = config.recipient.as_ref().map(ToString::to_string);
        let store = Store::open(&config.database_path, bootstrap_email.as_deref())
            .map_err(|_| "Impossible d’ouvrir la base du backoffice".to_owned())?;
        store
            .reset_two_factor()
            .map_err(|_| "Impossible de réinitialiser la double authentification".to_owned())?;
        println!("Double authentification réinitialisée ; les sessions et défis ont été révoqués.");
        return Ok(());
    }
    // Charger .env avant de créer les threads du runtime.
    let config = Config::from_env()?;
    let _database_lock = lock_database(&config.database_path)?;
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .map_err(|_| "Impossible d’initialiser le runtime".to_owned())?
        .block_on(run(config))
}

/// Verrou séparé de SQLite : le serveur le conserve toute sa durée de vie,
/// et l’outil de récupération refuse de modifier une instance encore active.
fn lock_database(path: &Path) -> Result<File, String> {
    if let Some(parent) = path
        .parent()
        .filter(|parent| !parent.as_os_str().is_empty())
    {
        std::fs::create_dir_all(parent)
            .map_err(|_| "Impossible de créer le dossier de la base".to_owned())?;
    }
    let mut lock_path = path.as_os_str().to_owned();
    lock_path.push(".lock");
    let mut options = OpenOptions::new();
    options.read(true).write(true).create(true).truncate(false);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let file = options
        .open(lock_path)
        .map_err(|_| "Impossible d’ouvrir le verrou de la base".to_owned())?;
    fs2::FileExt::try_lock_exclusive(&file).map_err(|_| {
        "La base est déjà utilisée ; arrêter le backend avant de réinitialiser la 2FA".to_owned()
    })?;
    Ok(file)
}

async fn run(config: Config) -> Result<(), String> {
    let bootstrap_email = config.recipient.as_ref().map(ToString::to_string);
    let store = Arc::new(Store::open(&config.database_path,bootstrap_email.as_deref()).map_err(|_| "Impossible d’initialiser la base ; CONTACT_EMAIL est nécessaire au premier démarrage".to_owned())?);
    let delivery = config
        .smtp
        .map(SmtpDelivery::new)
        .transpose()?
        .map(|delivery| Arc::new(delivery) as Arc<dyn portfolio_backend::mail::MailDelivery>);
    if delivery.is_none() {
        eprintln!(
            "Relais SMTP absent : les demandes seront conservées dans le backoffice sans notification par e-mail."
        );
    }
    let state = AppState::with_store(
        delivery,
        config.proxy_token,
        store,
        config.backoffice,
        config.secure_cookie,
    )?;
    let listener = tokio::net::TcpListener::bind(config.address)
        .await
        .map_err(|_| "Impossible d’ouvrir le port HTTP configuré".to_owned())?;
    println!("Backend démarré sur {}", config.address);
    axum::serve(
        listener,
        routes::router(state).into_make_service_with_connect_info::<SocketAddr>(),
    )
    .with_graceful_shutdown(shutdown())
    .await
    .map_err(|_| "Le serveur HTTP s’est interrompu".to_owned())
}

async fn shutdown() {
    let interrupt = async {
        let _ = tokio::signal::ctrl_c().await;
    };
    #[cfg(unix)]
    let terminate = async {
        if let Ok(mut signal) =
            tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
        {
            signal.recv().await;
        }
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();
    tokio::select! {
        _ = interrupt => {},
        _ = terminate => {},
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn recovery_lock_refuses_an_active_instance_then_allows_offline_access() {
        let path =
            std::env::temp_dir().join(format!("portfolio-lock-{}.sqlite3", std::process::id()));
        let server = lock_database(&path).unwrap();
        assert!(lock_database(&path).is_err());
        drop(server);
        let recovery = lock_database(&path).unwrap();
        drop(recovery);
        std::fs::remove_file(format!("{}.lock", path.display())).unwrap();
    }
}
