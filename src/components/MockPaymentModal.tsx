import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, CreditCard, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MockPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    amount: number;
    title: string;
}

export const MockPaymentModal = ({ isOpen, onClose, onSuccess, amount, title }: MockPaymentModalProps) => {
    const [step, setStep] = useState<'card' | 'processing' | 'success'>('card');

    useEffect(() => {
        if (isOpen) setStep('card');
    }, [isOpen]);

    const handlePay = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onSuccess();
            }, 1000);
        }, 2000); // Simulate network delay
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] glass-card border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-xl">Secure Checkout</DialogTitle>
                    <DialogDescription>Demo Payment Gateway (Simulation)</DialogDescription>
                </DialogHeader>

                {step === 'card' && (
                    <div className="space-y-4 py-2">
                        <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Paying for</p>
                                <p className="font-bold truncate max-w-[200px]">{title}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="text-2xl font-black text-primary">₹{amount}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Card Number</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="4242 4242 4242 4242" className="pl-9 bg-white/5 border-white/10" defaultValue="4242 4242 4242 4242" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Expiry</Label>
                                <Input placeholder="MM/YY" className="bg-white/5 border-white/10" defaultValue="12/28" />
                            </div>
                            <div className="space-y-2">
                                <Label>CVC</Label>
                                <Input placeholder="123" className="bg-white/5 border-white/10" defaultValue="123" />
                            </div>
                        </div>

                        <Button onClick={handlePay} className="w-full h-12 text-lg font-bold shadow-glow mt-2">
                            Pay ₹{amount}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5 pt-2">
                            <Shield className="h-3 w-3" /> Encrypted 256-bit connection
                        </p>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <h3 className="text-lg font-bold">Processing Payment...</h3>
                        <p className="text-muted-foreground">Please do not close this window.</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-scale-in">
                        <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-2">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold">Payment Successful!</h3>
                        <p className="text-muted-foreground">Redirecting to your course...</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
