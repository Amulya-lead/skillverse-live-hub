import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X, File, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
    onUpload: (url: string) => void;
    defaultValue?: string;
    accept?: string;
    folder?: string;
    label?: string;
}

export const FileUpload = ({ onUpload, defaultValue, accept = "image/*", folder = "misc", label = "Upload File" }: FileUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [value, setValue] = useState(defaultValue);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            setUploading(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('course-content')
                .upload(fileName, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data } = supabase.storage
                .from('course-content')
                .getPublicUrl(fileName);

            setValue(data.publicUrl);
            onUpload(data.publicUrl);
            toast.success("File uploaded successfully");

        } catch (error: any) {
            toast.error(error.message || "Error uploading file");
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const clearFile = () => {
        setValue("");
        onUpload("");
    };

    return (
        <div className="space-y-2">
            {value ? (
                <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/20">
                    {accept.startsWith("image") ? (
                        <div className="aspect-video relative">
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button variant="destructive" size="sm" onClick={clearFile} className="gap-2">
                                    <X className="h-4 w-4" /> Remove
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                                <File className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{value.split('/').pop()}</p>
                                <p className="text-xs text-green-500 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Uploaded
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={clearFile} className="text-muted-foreground hover:text-destructive">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 hover:border-primary/30 transition-all cursor-pointer group"
                >
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept={accept}
                    />
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        {uploading ? (
                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        ) : (
                            <Upload className="h-6 w-6 text-primary" />
                        )}
                    </div>
                    <p className="text-sm font-medium mb-1">{label}</p>
                    <p className="text-xs text-muted-foreground">
                        {uploading ? "Uploading..." : `Click to browse (${accept === 'image/*' ? 'JPG, PNG' : 'MP4, PDF'})`}
                    </p>
                </div>
            )}
        </div>
    );
};
