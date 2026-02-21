import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface CountryOption {
    value?: string;
    label: string;
    divider?: boolean;
}

interface CountrySelectProps {
    value?: string;
    onChange: (value: string) => void;
    options: CountryOption[];
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
}



export default function CountrySelect({
    value,
    onChange,
    options,
    disabled,
    readOnly,
    className,
}: CountrySelectProps) {
    const [open, setOpen] = useState(false);
    const selectedOption = options.find((o) => o.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-[5.5rem] justify-between px-2 h-12 bg-background dark:bg-white/5 border-border dark:border-white/10 hover:bg-accent hover:text-accent-foreground rounded-xl",
                        className
                    )}
                    disabled={disabled || readOnly}
                >
                    <div className="flex items-center gap-2">
                        {value ? (
                            <div className="flex items-center gap-2">
                                <img
                                    src={`https://flagcdn.com/w40/${value.toLowerCase()}.png`}
                                    srcSet={`https://flagcdn.com/w80/${value.toLowerCase()}.png 2x`}
                                    alt={value}
                                    className="w-5 h-auto object-cover rounded-[2px]"
                                />
                                <span className="text-sm font-medium">{value}</span>
                            </div>
                        ) : (
                            <span className="text-muted-foreground text-xs">??</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option, i) => {
                                if (option.divider) return null;
                                return (
                                    <CommandItem
                                        key={option.value || i}
                                        value={option.label}
                                        onSelect={() => {
                                            if (option.value) onChange(option.value);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="mr-2 w-6 flex items-center justify-center">
                                            {option.value && (
                                                <img
                                                    src={`https://flagcdn.com/w40/${option.value.toLowerCase()}.png`}
                                                    srcSet={`https://flagcdn.com/w80/${option.value.toLowerCase()}.png 2x`}
                                                    alt={option.value}
                                                    className="w-4 h-3 object-cover rounded-[1px]"
                                                />
                                            )}
                                        </div>
                                        {option.label}
                                        <span className="ml-auto text-muted-foreground text-xs">{option.value}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
