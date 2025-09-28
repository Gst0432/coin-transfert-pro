import { useEffect } from 'react';

export const useFavicon = (faviconUrl?: string) => {
  useEffect(() => {
    if (!faviconUrl) return;

    // Supprimer l'ancien favicon
    const existingFavicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    
    // Créer un nouveau favicon
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = faviconUrl;

    // Remplacer l'ancien par le nouveau
    if (existingFavicon) {
      document.head.removeChild(existingFavicon);
    }
    document.head.appendChild(favicon);

    // Nettoyer lors du démontage
    return () => {
      const currentFavicon = document.querySelector(`link[href="${faviconUrl}"]`);
      if (currentFavicon && document.head.contains(currentFavicon)) {
        document.head.removeChild(currentFavicon);
      }
    };
  }, [faviconUrl]);
};

export const updatePageMetadata = (settings: any) => {
  // Mettre à jour le titre de la page
  if (settings.meta_title) {
    document.title = settings.meta_title;
  }

  // Mettre à jour la meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && settings.meta_description) {
    metaDescription.setAttribute('content', settings.meta_description);
  }

  // Mettre à jour les meta keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords && settings.meta_keywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  if (metaKeywords && settings.meta_keywords) {
    metaKeywords.setAttribute('content', settings.meta_keywords);
  }

  // Mettre à jour Open Graph
  const updateOGMeta = (property: string, content: string) => {
    let ogMeta = document.querySelector(`meta[property="${property}"]`);
    if (!ogMeta) {
      ogMeta = document.createElement('meta');
      ogMeta.setAttribute('property', property);
      document.head.appendChild(ogMeta);
    }
    ogMeta.setAttribute('content', content);
  };

  if (settings.meta_title) {
    updateOGMeta('og:title', settings.meta_title);
  }
  if (settings.meta_description) {
    updateOGMeta('og:description', settings.meta_description);
  }
  if (settings.meta_image) {
    updateOGMeta('og:image', settings.meta_image);
  }

  // Mettre à jour Twitter Card
  const updateTwitterMeta = (name: string, content: string) => {
    let twitterMeta = document.querySelector(`meta[name="${name}"]`);
    if (!twitterMeta) {
      twitterMeta = document.createElement('meta');
      twitterMeta.setAttribute('name', name);
      document.head.appendChild(twitterMeta);
    }
    twitterMeta.setAttribute('content', content);
  };

  if (settings.meta_title) {
    updateTwitterMeta('twitter:title', settings.meta_title);
  }
  if (settings.meta_description) {
    updateTwitterMeta('twitter:description', settings.meta_description);
  }
  if (settings.meta_image) {
    updateTwitterMeta('twitter:image', settings.meta_image);
  }
};