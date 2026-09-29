/** Birlasoft Customer Insights lockup for the C360 hero. */
export function BirlasoftCustomer360Mark({ className = '' }: { className?: string }) {
  const logoSrc = `${import.meta.env.BASE_URL}birlasoft-logo.png`

  return (
    <div className={`cuw-c360-mark ${className}`.trim()} role="img" aria-label="Birlasoft Customer Insights">
      <img className="cuw-c360-mark__logo" src={logoSrc} alt="" width={120} height={32} decoding="async" />
      <div className="cuw-c360-mark__copy">
        <span className="cuw-c360-mark__product">Customer Insights</span>
      </div>
    </div>
  )
}
