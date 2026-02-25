type ProductInfoProps = {
  title: string
  price: string
  titleClassName?: string
}

export default function ProductInfo({ title, price, titleClassName }: ProductInfoProps) {
  return (
    <div className="flex items-baseline justify-between gap-x-4 pt-3 mt-auto">
      <h3
        className={`text-[13px] font-normal tracking-wide text-neutral-900 m-0 flex-1 min-w-0 leading-snug ${titleClassName ?? ""}`.trim()}
      >
        {title}
      </h3>
      <span className="text-[13px] font-normal text-neutral-900 shrink-0 tracking-wide">
        {price}
      </span>
    </div>
  )
}
