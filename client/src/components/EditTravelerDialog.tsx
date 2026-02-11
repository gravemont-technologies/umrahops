import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTravelerSchema, type Traveler } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface EditTravelerDialogProps {
    traveler: Traveler;
    onSuccess: () => void;
}

export function EditTravelerDialog({ traveler, onSuccess }: EditTravelerDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { t } = useLanguage();

    const form = useForm({
        resolver: zodResolver(insertTravelerSchema),
        defaultValues: {
            name: traveler.name,
            passportNumber: traveler.passportNumber,
            nationality: traveler.nationality,
            dob: traveler.dob,
            phone: traveler.phone || "",
            arrivalDate: traveler.arrivalDate || "",
            departureDate: traveler.departureDate || "",
            flightNumber: traveler.flightNumber || "",
            groupId: traveler.groupId,
        },
    });

    const onSubmit = async (values: any) => {
        try {
            const res = await fetch(`/api/travelers/${traveler.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Failed to update traveler");

            toast({
                title: t("travelerUpdated") || "Traveler updated successfully",
            });
            setOpen(false);
            onSuccess();
        } catch (error: any) {
            toast({
                title: t("error"),
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title={t("editTraveler") || "Edit Traveler"}>
                    <Edit2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("editTraveler") || "Edit Traveler"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("name")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="passportNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("passport")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nationality"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("nationality")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} maxLength={3} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dob"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("dob") || "Date of Birth"}</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="date" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("phone") || "Phone Number"}</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="+966..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="flightNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("flightNumber") || "Flight Number"}</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="SV123" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="arrivalDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("arrivalDate") || "Arrival Date"}</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="date" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="departureDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("departureDate") || "Departure Date"}</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="date" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {t("saveChanges") || "Save Changes"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
