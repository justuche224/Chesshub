const Authlayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main
      style={{
        backgroundImage:
          'url("/images/black-white-chess-pieces-black-background.jpg")',
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
      className="flex items-center justify-center h-[100svh] fixed top-0 w-full overflow-auto"
    >
      {children}
    </main>
  );
};

export default Authlayout;
