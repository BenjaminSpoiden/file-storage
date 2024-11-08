'use client'
import { Button } from "@/components/ui/Button";
import { api } from "@/convex/_generated/api";
import { SignOutButton } from "@clerk/nextjs";
import { useMutation } from "convex/react";

export default function Home() {
  const onCreatefile = useMutation(api.files.onCreateFile)
  return (
    <div className="">
      <SignOutButton>
        <Button>
          Sign out
        </Button>
      </SignOutButton>
      <Button onClick={() => {
        onCreatefile({
          name: 'test'
        })
      }}>
        Test file
      </Button>
    </div>
  );
}
