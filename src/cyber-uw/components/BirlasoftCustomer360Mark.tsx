/** Birlasoft Customer 360 lockup for the C360 hero. */
export function BirlasoftCustomer360Mark({ className = '' }: { className?: string }) {
  return (
    <div className={`cuw-c360-mark ${className}`.trim()}>
      <img
        className="cuw-c360-mark__img"
        src="/birlasoft-customer-360.png"
        alt="Birlasoft Customer 360"
        width={420}
        height={120}
        decoding="async"
      />
    </div>
  )
}
