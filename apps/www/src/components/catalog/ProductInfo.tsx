type ProductInfoProps = {
  title: string
  price: string
  titleClassName?: string
}

export default function ProductInfo({ title, price, titleClassName }: ProductInfoProps) {
  return (
    <div className="flex items-baseline justify-between gap-x-3 pt-2 sm:pt-3 mt-auto">
      <h3
        className={`text-[12px] sm:text-[13px] font-normal tracking-wide text-neutral-900 m-0 flex-1 min-w-0 leading-snug line-clamp-2 ${titleClassName ?? ""}`.trim()}
      >
        {title}
      </h3>
      <span className="text-[12px] sm:text-[13px] font-normal text-neutral-900 shrink-0 tracking-wide">
        {price}
      </span>
    </div>
  )
}
