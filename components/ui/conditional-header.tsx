"use client";

import { usePathname } from "next/navigation";
import Header from "./header";

export default function ConditionalHeader() {
    const pathname = usePathname();
    const isSoonPage = pathname === "/";

    // Don't show header on the "soon available" page
    if (isSoonPage) {
        return null;
    }

    return <Header />;
}

