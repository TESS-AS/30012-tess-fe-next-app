import CategoryContent from "@/components/category/category-content";
import { fetchCategories, findCategoryByName } from "@/lib/category-utils";
import { searchProducts } from "@/services/product.service";
import { formatUrlToDisplayName } from "@/utils/string-utils";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { loadFiltersBasedOnCategory } from "@/services/categories.service";

interface CategoryPageProps {
    params: Promise<{
        category: string;
    }>;
}

async function getProductsForCategory(categoryNumber: string, searchTerm: string | null = null) {
    try {
        return await searchProducts(
            1,          // page
            9,          // pageSize
            searchTerm,       // no searchTerm
            categoryNumber,
            null        // no filters
        );
    } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products");
    }
}

async function getFiltersForCategory(categoryId: string, searchTerm: string | null = null) {
    try {
        // Pass only the categoryNumber, no searchTerm for category page
        return await loadFiltersBasedOnCategory(categoryId, searchTerm);
    } catch (error) {
        console.error("Error fetching filters:", error);
        return []; // Return empty array instead of throwing
    }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    try {
        const { category } = await params;
        const locale = await getLocale();
        const formattedCategory = formatUrlToDisplayName(category);

        console.log(formattedCategory);

        const categories = await fetchCategories(locale);
        const categoryData = await findCategoryByName(
            categories,
            formattedCategory,
        );
        console.log(categoryData,"cat");

        if (!categoryData) {
            return notFound();
        }

        const {product} = categoryData.groupId
            ? await getProductsForCategory(categoryData.groupId)
            : {product: []};


        const filterCategories = await getFiltersForCategory(categoryData.groupId);

        return (
            <CategoryContent
                products={product}
                categoryData={categoryData}
                filters={filterCategories}
            />
        );
    } catch (error) {
        console.error("Error in CategoryPage:", error);
        throw error;
    }
}
