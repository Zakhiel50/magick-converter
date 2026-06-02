import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Magic Converter 1.0.1',
    short_name: 'MagickConv_1.0.1',
    description: 'Transformez vos images par lots en quelques secondes',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/icon-mobile.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-desktop.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "192x192",
        type: "image/png",
        form_factor: "narrow",
        label: "Interface mobile de Magic Converter"
      },
      {
        src: "/screenshot-desktop.png",
        sizes: "512x512",
        type: "image/png",
        form_factor: "wide",
        label: "Interface bureau de Magic Converter"
      }
    ],
  };
}
