import React, { useState, useMemo } from "react";
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
import flags from 'react-phone-number-input/flags';

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
                                <span className="w-5 h-3.5 flex items-center justify-center overflow-hidden rounded-[1px] shadow-sm">
                                    {flags[value as keyof typeof flags] ? (
                                        React.createElement(flags[value as keyof typeof flags])
                                    ) : (
                                        <span className="text-[10px]">{value}</span>
                                    )}
                                </span>
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
                                                <span className="w-5 h-3.5 flex items-center justify-center overflow-hidden rounded-[1px] shadow-sm">
                                                    {flags[option.value as keyof typeof flags] ? (
                                                        React.createElement(flags[option.value as keyof typeof flags])
                                                    ) : (
                                                        <span className="text-[10px]">{option.value}</span>
                                                    )}
                                                </span>
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
