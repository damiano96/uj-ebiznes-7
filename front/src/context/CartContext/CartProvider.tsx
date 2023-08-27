import React, {useMemo, useState} from "react";
import { CartContext } from "./CartContext";
import {addToCart, clearCart, getCart, removeFromCart, updateCart} from "../../services/apiCalls";
import {ICart} from "../../interfaces/ICart";
import {IProduct} from "../../interfaces/IProduct";

export const CartProvider = ({children}: {children: React.ReactNode}) => {
    const [shopCart, setShopCart] = useState<ICart[]>([]);

    React.useEffect(() => {
        getCart().then(data => setShopCart(data));
    }, []);

    const getShopCartPrice = (): number => {
        return shopCart?.reduce((previousValue, currentValue) => {
            return previousValue + (currentValue.Quantity * currentValue.Product.Price)
        }, 0) || 0;
    }

    const addProductToCart = (product: IProduct): void => {
        const actualShopCart: ICart[] = [...shopCart];
        const productIndex = actualShopCart.findIndex(cartProduct => cartProduct.Product.ID === product.ID);

        addToCart(product.ID).then((cart) => {
            if (productIndex !== -1) {
                actualShopCart[productIndex].Quantity += 1;
            } else {
                actualShopCart.push({Product: cart.Product, Quantity: cart.Quantity, ID: cart.ID})
            }

            setShopCart(actualShopCart);
        })
    }

    const clearShopCart = (): void => {
        clearCart().then(r => setShopCart([]));
    }

    const increaseCountOfItem = (idProduct: number): void => {
        const actualShopCart: ICart[] = [...shopCart];
        const productIndex = actualShopCart.findIndex(cartProduct => cartProduct.ID === idProduct);
        actualShopCart[productIndex].Quantity += 1;
        updateCart(actualShopCart[productIndex])
            .then(data => setShopCart(actualShopCart));
    }

    const reduceCountOfItem = (idProduct: number): void => {
        const actualShopCart: ICart[] = [...shopCart];
        const productIndex = actualShopCart.findIndex(cartProduct => cartProduct.ID === idProduct);

        if (actualShopCart[productIndex].Quantity > 1) {
            actualShopCart[productIndex].Quantity -= 1;
            updateCart(actualShopCart[productIndex])
                .then(data => setShopCart(actualShopCart));

        }

    }

    const removeItemFromCart = (idProduct: number): void => {
        const actualShopCart: ICart[] = [...shopCart];
        const productIndex = actualShopCart.findIndex(cartProduct => cartProduct.ID === idProduct);

        if (productIndex !== -1) {
            removeFromCart(actualShopCart[productIndex].Product.ID).then(data => {
                actualShopCart.splice(productIndex, 1);
                setShopCart(actualShopCart);
            });
        }
    }

    const providerValues = useMemo(() => ({
        shopCart,
        addProductToCart,
        clearShopCart,
        increaseCountOfItem,
        reduceCountOfItem,
        removeItemFromCart,
        getShopCartPrice
    }), [shopCart]);

    return (
         <CartContext.Provider value={providerValues}>
             {children}
         </CartContext.Provider>
    )
}