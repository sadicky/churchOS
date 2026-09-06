"use client";

import { Video, Music, ExternalLink, Disc3 } from "lucide-react";

interface MediaPlayerProps {
  videoUrl?: string | null;
  audioUrl?: string | null;
  notesUrl?: string | null;
  title: string;
  preacher: string;
}

export function MediaPlayer({
  videoUrl,
  audioUrl,
  notesUrl,
  title,
  preacher,
}: MediaPlayerProps) {
  // Convertit une URL YouTube ou Vimeo en URL d'intégration iframe
  const getEmbedUrl = (url: string): { isEmbed: boolean; src: string; type: "youtube" | "vimeo" | "direct" } => {
    try {
      if (url.includes("youtube.com/watch")) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get("v");
        if (v) return { isEmbed: true, src: `https://www.youtube-nocookie.com/embed/${v}`, type: "youtube" };
      }
      if (url.includes("youtu.be/")) {
        const parts = url.split("youtu.be/");
        const v = parts[1]?.split("?")[0];
        if (v) return { isEmbed: true, src: `https://www.youtube-nocookie.com/embed/${v}`, type: "youtube" };
      }
      if (url.includes("vimeo.com/")) {
        const parts = url.split("vimeo.com/");
        const v = parts[1]?.split("?")[0];
        if (v) return { isEmbed: true, src: `https://player.vimeo.com/video/${v}`, type: "vimeo" };
      }
      return { isEmbed: false, src: url, type: "direct" };
    } catch {
      return { isEmbed: false, src: url, type: "direct" };
    }
  };

  const videoInfo = videoUrl ? getEmbedUrl(videoUrl) : null;

  return (
    <div className="space-y-4">
      {/* Lecteur Vidéo si disponible */}
      {videoUrl && videoInfo ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-border">
          {videoInfo.isEmbed ? (
            <iframe
              src={videoInfo.src}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <video
              src={videoInfo.src}
              controls
              className="w-full h-full object-cover"
              poster=""
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          )}
        </div>
      ) : (
        /* Bannière visuelle de prédication si pas de vidéo */
        <div className="relative w-full p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-card border border-border/80 flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-4 shadow-sm">
            <Disc3 className="h-8 w-8 animate-spin-slow" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground max-w-xl">
            {title}
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Enseignement dispensé par {preacher}
          </p>
        </div>
      )}

      {/* Lecteur Audio si disponible */}
      {audioUrl && (
        <div className="p-4 bg-card border border-border rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Enregistrement Audio / Podcast</p>
              <p className="text-[11px] text-muted-foreground">Écoute intégrée de la prédication</p>
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <audio controls className="w-full h-9 rounded-lg" src={audioUrl}>
              Votre navigateur ne supporte pas le lecteur audio.
            </audio>
          </div>
        </div>
      )}

      {/* Téléchargement des notes si disponible */}
      {notesUrl && (
        <div className="flex items-center justify-end">
          <a
            href={notesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ouvrir le support / canevas de prédication externe
          </a>
        </div>
      )}
    </div>
  );
}
