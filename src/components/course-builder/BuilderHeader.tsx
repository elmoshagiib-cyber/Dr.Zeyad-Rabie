import { Button } from "../ui/Button";
import { Save, UploadCloud } from "lucide-react";

interface BuilderHeaderProps {
  onPublish?: () => void;
}

export function BuilderHeader({
  onPublish,
}: BuilderHeaderProps) {
  return (

    
    <div className="bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-8 py-6">


        {/* الأزرار */}

        <div className="flex items-center gap-3">

          <Button
            variant="outline"
            className="h-12 px-7 rounded-2xl"
          >
            <Save size={18} />
            حفظ كمسودة
          </Button>

          <Button
className="h-12 px-7 rounded-2xl"
onClick={onPublish}
>
            <UploadCloud size={18} />
            نشر الكورس
          </Button>

        </div>

      </div>
    </div>
  );
}