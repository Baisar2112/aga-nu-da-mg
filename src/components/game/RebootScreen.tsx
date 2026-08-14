export function RebootScreen({ seconds }: { seconds: number }) {
  return <div className="reboot-screen">
    <div className="spinner" />
    <h2>ПЕРЕЗАГРУЗКА</h2>
    <p>{Math.ceil(seconds)} СЕК.</p>
  </div>;
}
