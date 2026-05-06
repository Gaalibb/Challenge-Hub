import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="bg-destructive/10 text-destructive p-4 rounded-full">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Page Not Found</h1>
      <p className="text-muted-foreground max-w-sm">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link href="/">
        <Button className="mt-2">Return to EduLink360</Button>
      </Link>
    </div>
  );
}
