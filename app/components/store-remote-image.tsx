import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "src" | "unoptimized"> & { src: string };

/**
 * Imágenes de producto / medios remotos: sin pasar por `/_next/image?url=…` (más claro en el DOM
 * y un fetch menos al servidor). Las rutas locales (`/…`) siguen usando el optimizador.
 */
export function StoreRemoteImage({ src, ...rest }: Props) {
  const unoptimized = src.startsWith("https://") || src.startsWith("http://");
  return <Image src={src} unoptimized={unoptimized} {...rest} />;
}
