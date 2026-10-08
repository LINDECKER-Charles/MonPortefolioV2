use std::{net::SocketAddr, sync::Arc};

use portfolio_backend::{AppState, config::Config, mail::SmtpDelivery, routes};

fn main() {
    if let Err(error) = start() {
        // Les erreurs de configuration ne contiennent ni valeurs ni secrets.
        eprintln!("Impossible de démarrer le backend : {error}");
        std::process::exit(1);
    }
}

fn start() -> Result<(), String> {
    // Charger .env avant de créer les threads du runtime.
    let config = Config::from_env()?;
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .map_err(|_| "Impossible d’initialiser le runtime".to_owned())?
        .block_on(run(config))
}

async fn run(config: Config) -> Result<(), String> {
    let delivery = config
        .smtp
        .map(|smtp| SmtpDelivery::new(smtp, config.recipient))
        .transpose()?
        .map(|delivery| Arc::new(delivery) as Arc<dyn portfolio_backend::mail::MailDelivery>);
    if delivery.is_none() {
        eprintln!("Relais SMTP absent : le formulaire répondra 503 jusqu’à sa configuration.");
    }
    let state = AppState::new(delivery, config.proxy_token);
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
