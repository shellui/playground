export default {
  en: {
    layouts: {
      title: 'Layouts',
      lede: 'The same app in six shell layouts. Pick one and this window changes now. The shell keeps your pages, overlays and settings in every layout.',
      status: {
        config: 'This window uses {{layout}}, from your config.',
        override: 'This window uses {{layout}}. Your config sets {{config}}.',
        help: 'Pick another card to switch. The shell saves your choice in this browser until you go back to the config default.',
      },
      reset: 'Back to config default',
      badge: {
        inUse: 'In use',
        config: 'Config default',
        experimental: 'Experimental',
      },
      sidebar: {
        t: 'Sidebar',
        d: 'Navigation in a column on the left, content fills the rest.',
      },
      sidebarInset: {
        t: 'Sidebar inset',
        d: 'The sidebar sits in a tray and content gets a rounded frame.',
      },
      appBar: {
        t: 'App bar',
        d: 'Navigation in a bar across the top. Good for a few sections.',
      },
      appBarInset: {
        t: 'App bar inset',
        d: 'A top bar with content in a rounded frame below it.',
      },
      floating: {
        t: 'Floating',
        d: 'Glass navigation over full-bleed content. Good for maps and media.',
      },
      windows: {
        t: 'Windows',
        d: 'A taskbar, and every app opens in its own window.',
      },
      phone: {
        sheet: 'On phones a menu button opens it as a sheet.',
        edge: 'On phones the frame goes edge to edge.',
        tabs: 'On phones the navigation becomes tabs.',
        windows: 'On narrow or short screens it switches to a phone layout.',
      },
      fs: {
        t: 'Fullscreen is not in this list.',
        d: 'It shows the app with no shell navigation at all, so you could not switch back from here. Use it for apps that handle their own navigation, by setting `"layout": "fullscreen"` in the config.',
      },
      cfg: {
        t: 'Set it in your config',
        d: 'Picking a card here saves the layout for you, in this browser. To set the default for everyone, set `layout` in `shellui.config.json`.',
        help: 'Floating draws its chrome over your content. Call `applyLayoutChrome` so your app pads around it.',
      },
      cardsLabel: 'Shell layouts',
      jsonComment:
        '// Floating chrome sits over your content.\n// Pad your content root so nothing hides under it.',
    },
  },
  fr: {
    layouts: {
      title: 'Mises en page',
      lede: 'La même app dans six mises en page du shell. Choisissez-en une et cette fenêtre change tout de suite. Le shell garde vos pages, vos overlays et vos réglages dans chacune.',
      status: {
        config: "Cette fenêtre utilise {{layout}}, d'après votre config.",
        override: 'Cette fenêtre utilise {{layout}}. Votre config indique {{config}}.',
        help: "Choisissez une autre carte pour changer. Le shell garde votre choix dans ce navigateur jusqu'au retour à la valeur de la config.",
      },
      reset: 'Revenir à la config',
      badge: {
        inUse: 'Active',
        config: 'Valeur de la config',
        experimental: 'Expérimental',
      },
      sidebar: {
        t: 'Barre latérale',
        d: 'La navigation dans une colonne à gauche, le contenu occupe le reste.',
      },
      sidebarInset: {
        t: 'Barre latérale inset',
        d: 'La barre latérale est posée sur un plateau et le contenu a un cadre arrondi.',
      },
      appBar: {
        t: "Barre d'app",
        d: 'La navigation dans une barre en haut. Adaptée à quelques sections.',
      },
      appBarInset: {
        t: "Barre d'app inset",
        d: 'Une barre en haut et le contenu dans un cadre arrondi en dessous.',
      },
      floating: {
        t: 'Flottante',
        d: 'Une navigation en verre par-dessus un contenu pleine page. Adaptée aux cartes et aux médias.',
      },
      windows: {
        t: 'Fenêtres',
        d: "Une barre des tâches, et chaque app s'ouvre dans sa propre fenêtre.",
      },
      phone: {
        sheet: "Sur téléphone, un bouton menu l'ouvre en panneau.",
        edge: "Sur téléphone, le cadre va d'un bord à l'autre.",
        tabs: 'Sur téléphone, la navigation devient des onglets.',
        windows: 'Sur les écrans étroits ou bas, elle passe à une mise en page de téléphone.',
      },
      fs: {
        t: "Le plein écran n'est pas dans cette liste.",
        d: 'Il affiche l\'app sans aucune navigation du shell, vous ne pourriez donc pas revenir ici. Utilisez-le pour les apps qui gèrent leur propre navigation, avec `"layout": "fullscreen"` dans la config.',
      },
      cfg: {
        t: 'Réglez-la dans votre config',
        d: 'Choisir une carte ici enregistre la mise en page pour vous, dans ce navigateur. Pour la valeur par défaut de tout le monde, réglez `layout` dans `shellui.config.json`.',
        help: 'La mise en page flottante dessine son chrome par-dessus votre contenu. Appelez `applyLayoutChrome` pour que votre app laisse la place.',
      },
      cardsLabel: 'Mises en page du shell',
      jsonComment:
        '// Le chrome flottant est posé sur votre contenu.\n// Ajoutez une marge à la racine pour que rien ne passe dessous.',
    },
  },
};
