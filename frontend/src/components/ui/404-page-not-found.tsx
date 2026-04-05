import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Fullscreen GIF Background */}
      <img
        src="https://cdn.svgator.com/images/2024/04/electrocuted-caveman-animation-404-error-page.gif"
        alt="404 illustration"
        className="absolute inset-0 m-auto h-[70%] w-[70%] object-contain"
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-background/60" />
      
      {/* 404 Text - Above GIF */}
      <div className="absolute top-12 left-0 right-0 z-10 flex justify-center">
        <span className="text-[180px] font-black text-primary/20 select-none tracking-wider">
          404
        </span>
      </div>

      {/* Content - Below GIF */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-end pb-16">
        <div className="mx-auto w-full max-w-md px-4">
          <div className="flex flex-col items-center animate-fade-in">
            <div className="text-center">
              <h1 className="mb-3 text-3xl font-bold text-foreground drop-shadow-md">
                Oops! You're lost
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                The page you are looking for doesn't exist.
              </p>

              <Button
                onClick={() => navigate("/")}
                className="px-8 py-3 bg-success hover:bg-success/90 text-success-foreground font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
