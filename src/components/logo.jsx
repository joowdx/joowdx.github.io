import logo from '../../public/favicon.ico';

export default function () {
  return (
    <div className="flex items-center">
      <a
        href="#"
        onClick={(event) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <img src={logo} alt="Logo" className="h-8 w-8" />
      </a>
    </div>
  );
}
