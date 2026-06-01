import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const width = formData.get('width') as string;
    const height = formData.get('height') as string;
    const format = (formData.get('format') as string || 'jpg').toLowerCase();
    const quality = parseInt(formData.get('quality') as string || '80', 10);
    const originalName = formData.get('originalName') as string || 'image';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let pipeline = sharp(buffer);

    // Redimensionnement
    if (width || height) {
      pipeline = pipeline.resize({
        width: width ? parseInt(width, 10) : undefined,
        height: height ? parseInt(height, 10) : undefined,
        fit: (width && height) ? 'cover' : 'inside', // 'cover' recadre pour remplir les dimensions sans déformer
      });
    }

    // Conversion de format et qualité
    // Note: sharp utilise des méthodes différentes selon le format
    switch (format) {
      case 'jpg':
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        break;
      case 'png':
        // PNG est sans perte, mais on peut ajuster la compression
        pipeline = pipeline.png({ quality, palette: quality < 100 });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality });
        break;
      case 'gif':
        pipeline = pipeline.gif();
        break;
      default:
        pipeline = pipeline.toFormat(format as keyof sharp.FormatEnum);
    }

    const outputBuffer = await pipeline.toBuffer();
    
    // Génération du nom de fichier
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const finalFileName = `${baseName}.${format}`;
    
    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': `image/${format}`,
        'Content-Disposition': `attachment; filename="${finalFileName}"`,
      },
    });

  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
