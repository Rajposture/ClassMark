const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} ClassMark. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
