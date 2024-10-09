const Authlayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        backgroundImage: 'url("/images/pexels-pixabay-256490.jpg")',
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
      className="flex items-center justify-center pt-52 h-[100vh] fixed top-0 w-full overflow-auto"
    >
      {children}
    </div>
  );
};

export default Authlayout;
