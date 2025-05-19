import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface PaginationData {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

interface PaginationProps {
    pagination: PaginationData
    onPageChange: (page: number) => void
    onItemsPerPageChange: (value: string) => void
    itemsPerPageOptions?: number[]
}

export function Pagination({
    pagination,
    onPageChange,
    onItemsPerPageChange,
    itemsPerPageOptions = [50, 100, 200]
}: PaginationProps) {
    return (
        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                    {pagination.totalItems} éléments au total
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="itemsPerPage" className="text-sm">Éléments par page :</Label>
                    <Select
                        value={pagination.itemsPerPage.toString()}
                        onValueChange={onItemsPerPageChange}
                    >
                        <SelectTrigger className="h-8 w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {itemsPerPageOptions.map((value) => (
                                <SelectItem key={value} value={value.toString()}>
                                    {value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                >
                    Précédent
                </Button>
                <div className="text-sm">
                    Page {pagination.currentPage} sur {pagination.totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                >
                    Suivant
                </Button>
            </div>
        </div>
    )
} 