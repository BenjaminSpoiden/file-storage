import { Doc } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { DownloadIcon } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import { AspectRatio } from "./ui/AspectRatio"

export const FileCard: React.FC<{ file: Doc<'files'> & { url: string | null } }> = ({ file }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div>
      <Card className="w-full max-w-md mx-auto my-4 border border-white/20 bg-white/10 rounded-lg backdrop-blur-md shadow-lg">
        <CardHeader className="flex flex-col gap-4">
          <AspectRatio ratio={16 / 10} className="bg-muted">
            <Image src={file.url?? ''} fill alt={file.name} />
          </AspectRatio>
          <div>
            <CardTitle className="text-lg text-white">{file.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Uploaded on {format(new Date(file._creationTime), 'PPP')}
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            <DownloadIcon className="mr-2 h-4 w-4" /> Download
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}