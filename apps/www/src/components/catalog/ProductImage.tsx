type ProductImageProps = {
  src: string | null | undefined
  /** Segunda imagen: se muestra al hacer hover sobre la card */
  srcHover?: string | null
  alt: string
  sizes?: string
}

const defaultSizes = "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"

export default function ProductImage({ src, srcHover, alt, sizes = defaultSizes }: ProductImageProps) {
  const hasHover = srcHover && srcHover !== src

  return (
    <div className="group relative aspect-[3/4] bg-[#f3f3f3] overflow-hidden flex items-center justify-center">
      {src ? (
        <>
          <img
            src={src}
            alt={alt}
            sizes={sizes}
            className="w-full h-full object-cover object-center block transition-all duration-300 group-hover:scale-[1.03]"
          />
          {hasHover && (
            <img
              src={srcHover}
              alt=""
              sizes={sizes}
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </>
      ) : (
        <div className="w-full h-full min-h-[200px] bg-neutral-200" aria-hidden />
      )}
    </div>
  )
}
