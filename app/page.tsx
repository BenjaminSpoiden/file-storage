import { Card } from "@/components/Card";
import { UploadFile } from "@/components/UploadFileButton";

export default function Home() {
 
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center">
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
          Your Files
        </h1>
        <UploadFile />
      </div>
      
      <div className="mt-4">
        <Card />
      </div>
    </div>
  );
}
