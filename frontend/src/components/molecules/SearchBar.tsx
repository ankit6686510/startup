import { useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    className?: string;
}

export function SearchBar({ placeholder = "Search...", onSearch, className }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className={cn("max-w-md relative group", className)}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-muted rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-white border border-input rounded-lg p-1.5 shadow-sm">
                <SearchIcon className="ml-3 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
                />
                <Button
                    type="submit"
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-4"
                >
                    Search
                </Button>
            </div>
        </form>
    );
}
