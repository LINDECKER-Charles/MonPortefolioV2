/**
 * Les 153 sources de gup, par famille, telles que son registre les déclare
 * (src/core/registry.ts, ALL_PROVIDERS, release 0.5.3, commit 0c0e85a du
 * 06/10/2026), relevées à l’exécution le 13/10/2026. La famille est le
 * dossier du fichier de la source (src/providers/<famille>/). Le système est
 * l’ensemble PLATFORMS déclaré par la source : « tous » sans déclaration.
 *
 * Données de la figure GUP-F2 (components/projets/gup/FigureSources.astro).
 * Fichier généré depuis le registre : ne pas retoucher à la main.
 */
export type SystemeSource = 'tous' | 'windows' | 'macos' | 'pas-windows';

export interface FamilleSources {
  id: string;
  nom: string;
  /** [identifiant, nom affiché par gup, systèmes] */
  sources: readonly (readonly [string, string, SystemeSource])[];
}

export const FAMILLES_SOURCES: readonly FamilleSources[] = [
  {
    id: 'os',
    nom: 'Systèmes d’exploitation',
    sources: [
      ['winget', 'Winget', 'windows'],
      ['scoop', 'Scoop', 'windows'],
      ['choco', 'Chocolatey', 'windows'],
      ['msys2', 'MSYS2 (pacman)', 'windows'],
      ['cygwin', 'Cygwin', 'windows'],
      ['npackd', 'Npackd', 'windows'],
      ['brew', 'Homebrew', 'pas-windows'],
      ['brew-cask', 'Homebrew (casks)', 'macos'],
      ['mas', 'Mac App Store', 'macos'],
      ['macports', 'MacPorts', 'macos'],
      ['sparkle', 'Sparkle (macOS apps)', 'macos'],
      ['fink', 'Fink', 'macos'],
      ['nix', 'Nix', 'pas-windows'],
      ['pkgx', 'pkgx', 'pas-windows'],
      ['pkgin', 'pkgin (pkgsrc)', 'pas-windows'],
    ],
  },
  {
    id: 'wsl',
    nom: 'WSL',
    sources: [
      ['wsl', 'WSL (kernel)', 'windows'],
      ['wsl-apt', 'WSL · apt (Debian/Ubuntu)', 'windows'],
      ['wsl-dnf', 'WSL · dnf (Fedora)', 'windows'],
      ['wsl-pacman', 'WSL · pacman (Arch)', 'windows'],
      ['wsl-brew', 'WSL · Homebrew', 'windows'],
      ['wsl-flatpak', 'WSL · Flatpak', 'windows'],
      ['wsl-nix', 'WSL · Nix', 'windows'],
    ],
  },
  {
    id: 'node',
    nom: 'Node.js',
    sources: [
      ['npm-g', 'npm (global)', 'tous'],
      ['pnpm-g', 'pnpm (global)', 'tous'],
      ['yarn-g', 'yarn (global)', 'tous'],
      ['bun-g', 'Bun global', 'tous'],
      ['deno', 'Deno', 'tous'],
      ['corepack', 'Corepack', 'tous'],
      ['fnm', 'fnm (Node version manager)', 'tous'],
      ['volta', 'Volta', 'tous'],
      ['nvm-windows', 'nvm-windows', 'windows'],
      ['nvm', 'nvm (Node version manager)', 'pas-windows'],
    ],
  },
  {
    id: 'python',
    nom: 'Python',
    sources: [
      ['pip', 'pip (user)', 'tous'],
      ['pipx', 'pipx', 'tous'],
      ['uv-tools', 'uv tools', 'tous'],
      ['poetry', 'Poetry', 'tous'],
      ['pdm', 'PDM', 'tous'],
      ['rye', 'Rye', 'tous'],
      ['pyenv-win', 'pyenv-win', 'windows'],
      ['pyenv', 'pyenv', 'pas-windows'],
      ['conda', 'Conda', 'tous'],
    ],
  },
  {
    id: 'toolchain',
    nom: 'Gestionnaires de versions',
    sources: [
      ['goenv', 'goenv', 'tous'],
      ['mise', 'mise (toolchains)', 'tous'],
      ['asdf', 'asdf-vm', 'tous'],
      ['proto', 'proto (moonrepo)', 'tous'],
      ['sdkman', 'SDKMAN!', 'tous'],
      ['swiftly', 'swiftly (Swift)', 'pas-windows'],
    ],
  },
  {
    id: 'lang-other',
    nom: 'Autres langages',
    sources: [
      ['gem', 'RubyGems', 'tous'],
      ['opam', 'opam (OCaml)', 'tous'],
      ['hex', 'Hex (Elixir)', 'tous'],
      ['mix-archive', 'Mix archives', 'tous'],
      ['luarocks', 'LuaRocks', 'tous'],
      ['cabal', 'cabal-install', 'tous'],
      ['stack', 'Stack (Haskell)', 'tous'],
      ['nimble', 'Nimble (Nim)', 'tous'],
      ['julia-pkg', 'Julia Pkg', 'tous'],
      ['R-packages', 'R (CRAN)', 'tous'],
      ['vcpkg', 'vcpkg (C/C++)', 'tous'],
      ['mint', 'Mint (Swift)', 'pas-windows'],
      ['flutter', 'Flutter SDK', 'tous'],
      ['pub-global', 'Dart pub global', 'tous'],
    ],
  },
  {
    id: 'dotnet-php',
    nom: '.NET et PHP',
    sources: [
      ['dotnet-tools', '.NET tools (global)', 'tous'],
      ['dotnet-sdk', '.NET SDK', 'tous'],
      ['nuget', 'NuGet CLI', 'tous'],
      ['composer-self', 'Composer', 'tous'],
      ['composer-g', 'Composer (global)', 'tous'],
      ['symfony-cli', 'Symfony CLI', 'tous'],
      ['phive', 'PHIVE', 'tous'],
    ],
  },
  {
    id: 'jvm',
    nom: 'JVM',
    sources: [
      ['jbang', 'JBang', 'tous'],
      ['coursier-cs', 'Coursier (cs)', 'tous'],
    ],
  },
  {
    id: 'rust',
    nom: 'Rust',
    sources: [
      ['rustup', 'Rustup (toolchains)', 'tous'],
      ['cargo', 'Cargo (Rust)', 'tous'],
    ],
  },
  {
    id: 'shell',
    nom: 'Shell et terminal',
    sources: [
      ['pwsh-modules', 'PowerShell modules', 'tous'],
      ['psresource', 'PowerShell PSResourceGet', 'tous'],
      ['oh-my-posh', 'Oh My Posh', 'tous'],
      ['starship', 'Starship', 'tous'],
      ['nerd-fonts', 'Nerd Fonts', 'windows'],
    ],
  },
  {
    id: 'cloud',
    nom: 'Cloud',
    sources: [
      ['az', 'Azure CLI', 'tous'],
      ['gcloud', 'gcloud components', 'tous'],
      ['doctl', 'DigitalOcean CLI', 'tous'],
      ['flyctl', 'Fly.io CLI', 'tous'],
      ['aws-cli-v2', 'AWS CLI v2', 'tous'],
      ['oci-cli', 'Oracle Cloud CLI', 'tous'],
      ['scw', 'Scaleway CLI', 'tous'],
      ['hcloud', 'Hetzner Cloud CLI', 'tous'],
      ['linode-cli', 'Linode CLI', 'tous'],
      ['supabase', 'Supabase CLI', 'tous'],
      ['heroku', 'Heroku CLI', 'tous'],
      ['railway', 'Railway CLI', 'tous'],
    ],
  },
  {
    id: 'iac',
    nom: 'Infrastructure as code',
    sources: [
      ['terraform', 'Terraform', 'tous'],
      ['opentofu', 'OpenTofu', 'tous'],
      ['terragrunt', 'Terragrunt', 'tous'],
      ['vault', 'Vault', 'tous'],
      ['consul', 'Consul', 'tous'],
      ['nomad', 'Nomad', 'tous'],
      ['packer', 'Packer', 'tous'],
      ['boundary', 'Boundary', 'tous'],
      ['tflint', 'TFLint', 'tous'],
      ['pulumi', 'Pulumi', 'tous'],
    ],
  },
  {
    id: 'kubernetes',
    nom: 'Kubernetes',
    sources: [
      ['helm', 'Helm', 'tous'],
      ['helm-repo', 'Helm repositories', 'tous'],
      ['helm-plugins', 'Helm plugins', 'tous'],
      ['kubectl', 'kubectl', 'tous'],
      ['krew', 'Krew (kubectl plugins)', 'tous'],
      ['kustomize', 'Kustomize', 'tous'],
      ['flux', 'Flux CLI', 'tous'],
      ['argocd', 'ArgoCD CLI', 'tous'],
      ['k3d', 'k3d', 'tous'],
      ['kind', 'kind', 'tous'],
      ['minikube', 'Minikube', 'tous'],
      ['skaffold', 'Skaffold', 'tous'],
      ['tilt', 'Tilt', 'tous'],
    ],
  },
  {
    id: 'containers',
    nom: 'Conteneurs',
    sources: [
      ['nerdctl', 'nerdctl', 'tous'],
      ['oras', 'ORAS', 'tous'],
      ['dive', 'dive', 'tous'],
      ['docker-desktop', 'Docker Desktop', 'windows'],
      ['podman-desktop', 'Podman Desktop', 'windows'],
      ['rancher-desktop', 'Rancher Desktop', 'windows'],
    ],
  },
  {
    id: 'security',
    nom: 'Sécurité',
    sources: [
      ['trivy', 'Trivy', 'tous'],
      ['grype', 'Grype', 'tous'],
      ['syft', 'Syft', 'tous'],
      ['cosign', 'Cosign', 'tous'],
      ['rekor', 'Rekor CLI', 'tous'],
      ['gitsign', 'gitsign', 'tous'],
      ['nuclei', 'Nuclei', 'tous'],
      ['nuclei-templates', 'Nuclei templates', 'tous'],
      ['pdtm', 'ProjectDiscovery tool manager', 'tous'],
      ['semgrep', 'Semgrep', 'tous'],
    ],
  },
  {
    id: 'dev-cli',
    nom: 'Outils en ligne de commande',
    sources: [
      ['lazygit', 'Lazygit', 'tous'],
      ['lazydocker', 'Lazydocker', 'tous'],
      ['jj', 'Jujutsu (jj)', 'tous'],
      ['delta', 'git-delta', 'tous'],
      ['glab', 'GitLab CLI', 'tous'],
      ['tea', 'Gitea CLI (tea)', 'tous'],
      ['gh-ext', 'GitHub CLI extensions', 'tous'],
      ['git-for-windows', 'Git for Windows', 'windows'],
    ],
  },
  {
    id: 'embedded-mobile',
    nom: 'Embarqué et mobile',
    sources: [
      ['arduino-cli', 'Arduino CLI', 'tous'],
      ['platformio', 'PlatformIO Core', 'tous'],
      ['android-sdk', 'Android SDK', 'tous'],
      ['xcodes', 'xcodes (Xcode version manager)', 'macos'],
      ['expo', 'Expo CLI', 'tous'],
      ['fastlane', 'Fastlane', 'tous'],
    ],
  },
  {
    id: 'ide',
    nom: 'IDE',
    sources: [
      ['vscode-ext', 'VS Code extensions', 'tous'],
      ['cursor-ext', 'Cursor extensions', 'tous'],
      ['windsurf-ext', 'Windsurf extensions', 'tous'],
      ['vscodium-ext', 'VSCodium extensions', 'tous'],
      ['jetbrains', 'JetBrains IDEs', 'tous'],
      ['visual-studio', 'Visual Studio', 'windows'],
    ],
  },
  {
    id: 'editor-plugins',
    nom: 'Extensions d’éditeurs',
    sources: [
      ['nvim-lazy', 'lazy.nvim', 'tous'],
      ['nvim-packer', 'packer.nvim', 'tous'],
      ['nvim-mason', 'mason.nvim', 'tous'],
      ['vim-plug', 'vim-plug', 'tous'],
    ],
  },
  {
    id: 'self',
    nom: 'Les gestionnaires eux-mêmes',
    sources: [
      ['self', 'Self (package managers)', 'tous'],
    ],
  },
];
