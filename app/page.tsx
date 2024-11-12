import { FileCard } from "@/components/FileCard";
import { SideNav } from "@/components/SideNav";
import { UploadFile } from "@/components/UploadFileButton";
import { api } from "@/convex/_generated/api";
import { getUserData } from "@/lib/auth";
import { fetchQuery } from "convex/nextjs";

export default async function Home() {
 
  const { userId, orgId: organisationId, tokenIdentifier } = await getUserData()
  let orgId: string = '';
  orgId = organisationId ?? userId ?? '';
  const files = await fetchQuery(
    api.files.onGetFiles,
    { orgId, token: tokenIdentifier }
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white overflow-x-hidden flex">
      <SideNav />
      <main 
        className="flex-1 p-10 ml-20"
      >
        <section 
          className="flex flex-col gap-5 max-w-5xl mx-auto"
        >
          <div className="flex items-center justify-between">
            <h1 
              className="text-4xl font-bold"
            >
              Dashboard
            </h1>
            <UploadFile />
          </div>
         
          <div 
            className="w-full h-80 border border-white/20 bg-white/10 rounded-lg backdrop-blur-md shadow-lg"
          />
          <div className="flex flex-col md:flex-row gap-5 w-full">
            <div 
              className="border-white/20 h-60 w-full md:w-1/2 bg-white/10 rounded-lg backdrop-blur-md shadow-lg border"
            />
            <div 
              className="border-white/20 h-60 w-full md:w-1/2 bg-white/10 rounded-lg backdrop-blur-md shadow-lg border"
            />
          </div>
        </section>
      </main>
    </div>
    // <div className="w-full min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-x-hidden flex flex-col">
    //   <SideNav />
    //   <div className="container mx-auto">
    //     <div className="flex justify-between items-center">
    //       <h1 className="scroll-m-20 text-3xl text-white font-extrabold tracking-tight lg:text-4xl">
    //         Your Files
    //       </h1>
    //       <UploadFile />
    //     </div>
        
    //     <div className="mt-4">
    //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    //         {files?.map((file) => <FileCard key={file._id} file={file} />)}
    //       </div>
    //     </div>
    //   </div>
     
    // </div>
  );
}
