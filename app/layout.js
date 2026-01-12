import "./globals.css";

export const metadata = {
  title: "BET Platform - Gestion Collaborative de Projets",
  description: "Plateforme collaborative pour Bureau d'Études - Coordination inter-lots et suivi de projets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
