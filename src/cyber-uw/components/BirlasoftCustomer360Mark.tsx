/** Birlasoft Customer 360 lockup for the C360 hero. */
export function BirlasoftCustomer360Mark({ className = '' }: { className?: string }) {
  const src = `${import.meta.env.BASE_URL}birlasoft-customer-360.png`

  return (
    <div className={`cuw-c360-mark ${className}`.trim()}>
      <img
        className="cuw-c360-mark__img"
        src={src}
        alt="Birlasoft Customer 360"
        width={420}
        height={120}
        decoding="async"
      />
    </div>
  )
}
