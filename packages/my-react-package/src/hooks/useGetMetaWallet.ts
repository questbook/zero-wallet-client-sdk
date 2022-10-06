import { useState,useEffect } from "react";
import { MetaWallet } from "../MetaWallet";

export function useGetMetaWallet() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [wallet, setWallet] = useState<MetaWallet>();
    
    useEffect(() => {
        if (!localStorage) return;
        
        setWallet(new MetaWallet());
        setIsLoading(false);
    }, [])

    return { zeroWallet: wallet,isLoading };

}