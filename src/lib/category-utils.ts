import { mapCategoryTree } from "@/lib/utils";
import axiosInstance from "@/services/axiosServer";
import { Category, RawCategory } from "@/types/categories.types";

export async function fetchCategories(locale: string) {
    try {
        const response = await axiosInstance.get(`/categories/${locale}`);
        const rawCategories: RawCategory[] = response.data;
        return rawCategories.map((node) => mapCategoryTree(node, locale));
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw new Error("Failed to fetch categories");
    }
}

export async function findCategoryByName(categories: Category[], name: string) {
    return categories?.find(
        (cat) => cat?.name?.toLowerCase() === name.toLowerCase()
    );
}

export async function findSubCategoryByName(categories: Category[], name: string) {
    return categories
        .flatMap((cat) => cat?.subcategories || [])
        .find((subCat) => 
            subCat?.name?.toLowerCase() === name.toLowerCase()
        );
}
