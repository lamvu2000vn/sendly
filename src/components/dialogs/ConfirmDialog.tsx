import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
};

export default function ConfirmDialog({
    open,
    title,
    message,
    onConfirm,
    onOpenChange,
    confirmText,
    cancelText,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass border-border rounded-3xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-heading text-xl">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        className="rounded-xl font-bold"
                        onClick={() => onOpenChange(false)}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="destructive"
                        className="glow-destructive rounded-xl font-bold shadow-lg"
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
