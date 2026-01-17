import { useNavigate } from "react-router-dom";
import EditorLayout from "@/components/EditorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Scissors, Palette, Image, Sparkles } from "lucide-react";

const Generate = () => {
    const navigate = useNavigate();

    const studios = [
        {
            title: "Portrait Studio",
            description: "Professional headshots and business attire.",
            icon: User,
            route: "/portrait-studio",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10"
        },
        {
            title: "Hair Studio",
            description: "Try new hairstyles and colors.",
            icon: Scissors,
            route: "/hair-studio",
            color: "text-purple-500",
            bgColor: "bg-purple-500/10"
        },
        {
            title: "Accessories Studio",
            description: "Add glasses, jewelry, and ties.",
            icon: Palette,
            route: "/accessories-studio",
            color: "text-pink-500",
            bgColor: "bg-pink-500/10"
        },
        {
            title: "Background Studio",
            description: "Change your environment to a professional office.",
            icon: Image,
            route: "/background-studio",
            color: "text-amber-500",
            bgColor: "bg-amber-500/10"
        },
        {
            title: "Prompt Yourself",
            description: "Describe any custom modification you want.",
            icon: Sparkles,
            route: "/prompt-yourself-studio",
            color: "text-green-500",
            bgColor: "bg-green-500/10"
        }
    ];

    return (
        <EditorLayout>
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in">
                <div className="w-full max-w-5xl space-y-8 text-center">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight font-serif">Select Your Studio</h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Choose the specific type of enhancement you want to perform. Each studio is optimized for professional results.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studios.map((studio) => (
                            <Card
                                key={studio.title}
                                className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/20"
                                onClick={() => navigate(studio.route)}
                            >
                                <CardHeader>
                                    <div className={`w-14 h-14 rounded-2xl ${studio.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <studio.icon className={`w-7 h-7 ${studio.color}`} />
                                    </div>
                                    <CardTitle>{studio.title}</CardTitle>
                                    <CardDescription>{studio.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                                        Enter Studio
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </EditorLayout>
    );
};

export default Generate;
