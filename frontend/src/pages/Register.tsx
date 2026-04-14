import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MultiFaceCapture from "@/components/MultiFaceCapture";
import UniformUploadSection from "@/components/UniformUploadSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import companyLogo from "@/assets/company-logo.png";
import schoolLogo from "@/assets/school-logo.jpg";

interface FormErrors {
  studentName?: string;
  rollNumber?: string;
  schoolName?: string;
  photos?: string;
  goodUniform?: string;
  badUniform?: string;
}

const Register = () => {
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [photos, setPhotos] = useState<(string | null)[]>(Array(6).fill(null));
  const [goodUniform, setGoodUniform] = useState<string | null>(null);
  const [badUniform, setBadUniform] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!studentName.trim()) newErrors.studentName = "Student name is required.";
    else if (studentName.trim().length > 100) newErrors.studentName = "Name must be under 100 characters.";
    if (!rollNumber.trim()) newErrors.rollNumber = "Roll number is required.";
    else if (rollNumber.trim().length > 30) newErrors.rollNumber = "Roll number must be under 30 characters.";
    if (!schoolName.trim()) newErrors.schoolName = "School name is required.";
    else if (schoolName.trim().length > 150) newErrors.schoolName = "School name must be under 150 characters.";
    if (!photos.every(Boolean)) newErrors.photos = "All 6 face images are required.";
    if (!goodUniform) newErrors.goodUniform = "Proper uniform photo is required.";
    if (!badUniform) newErrors.badUniform = "Improper uniform photo is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      // @ts-ignore
      const { registerStudent } = await import("@/lib/api");
      
      await registerStudent({
        studentName,
        rollNumber,
        schoolName,
        photos: photos as string[], // Already validated as all 6 strings
        goodUniform: goodUniform as string,
        badUniform: badUniform as string,
      });

      toast.success("Student registered successfully!", {
        description: `${studentName.trim()} has been registered.`,
      });
      handleReset();
    } catch (err: any) {
      toast.error("Registration failed", {
        description: err.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStudentName("");
    setRollNumber("");
    setSchoolName("");
    setPhotos(Array(6).fill(null));
    setGoodUniform(null);
    setBadUniform(null);
    setErrors({});
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-start justify-center px-3 sm:px-4 py-6 sm:py-12 md:py-16">
        <Card className="w-full max-w-lg animate-fade-in-up border-0 shadow-lg">
          <CardHeader className="space-y-3 pb-4 sm:pb-6 px-4 sm:px-6">
            <Link
              to="/"
              className="mb-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
            <div className="flex items-center justify-center gap-3 sm:gap-4 py-2">
              <img src={companyLogo} alt="GateX Innovations" className="h-10 sm:h-14 w-auto object-contain" />
              <img src={schoolLogo} alt="The Indian Revolutionary School" className="h-10 sm:h-14 w-auto object-contain" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Student Registration</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Fill in the details below to register a new student.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Name */}
              <div className="space-y-1.5">
                <label htmlFor="studentName" className="text-sm font-medium text-foreground">
                  Student Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="studentName"
                  placeholder="Enter student name"
                  value={studentName}
                  onChange={(e) => { setStudentName(e.target.value); setErrors((p) => ({ ...p, studentName: undefined })); }}
                  aria-invalid={!!errors.studentName}
                  className={errors.studentName ? "border-destructive" : ""}
                />
                {errors.studentName && <p className="text-xs text-destructive">{errors.studentName}</p>}
              </div>

              {/* Roll Number */}
              <div className="space-y-1.5">
                <label htmlFor="rollNumber" className="text-sm font-medium text-foreground">
                  Roll Number <span className="text-destructive">*</span>
                </label>
                <Input
                  id="rollNumber"
                  placeholder="Enter roll number"
                  value={rollNumber}
                  onChange={(e) => { setRollNumber(e.target.value); setErrors((p) => ({ ...p, rollNumber: undefined })); }}
                  aria-invalid={!!errors.rollNumber}
                  className={errors.rollNumber ? "border-destructive" : ""}
                />
                {errors.rollNumber && <p className="text-xs text-destructive">{errors.rollNumber}</p>}
              </div>

              {/* School Name */}
              <div className="space-y-1.5">
                <label htmlFor="schoolName" className="text-sm font-medium text-foreground">
                  School Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="schoolName"
                  placeholder="Enter school name"
                  value={schoolName}
                  onChange={(e) => { setSchoolName(e.target.value); setErrors((p) => ({ ...p, schoolName: undefined })); }}
                  aria-invalid={!!errors.schoolName}
                  className={errors.schoolName ? "border-destructive" : ""}
                />
                {errors.schoolName && <p className="text-xs text-destructive">{errors.schoolName}</p>}
              </div>

              {/* Divider */}
              <div className="border-t pt-2" />

              {/* Multi Face Capture */}
              <MultiFaceCapture photos={photos} onPhotosChange={(p) => { setPhotos(p); setErrors((e) => ({ ...e, photos: undefined })); }} />
              {errors.photos && <p className="text-xs text-destructive">{errors.photos}</p>}

              {/* Divider */}
              <div className="border-t pt-2" />

              {/* Uniform Verification */}
              <UniformUploadSection
                goodUniform={goodUniform}
                badUniform={badUniform}
                onGoodUniformChange={(img) => { setGoodUniform(img); setErrors((e) => ({ ...e, goodUniform: undefined })); }}
                onBadUniformChange={(img) => { setBadUniform(img); setErrors((e) => ({ ...e, badUniform: undefined })); }}
                errors={{ goodUniform: errors.goodUniform, badUniform: errors.badUniform }}
              />

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Submitting…" : "Submit"}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
