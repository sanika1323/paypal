export const getInrUsdReferenceRate = async () => {
    const response = await fetch("https://api.frankfurter.dev/v2/rate/inr/usd", {
        headers: {
            Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
        throw new Error("EXCHANGE_RATE_UNAVAILABLE");
    }
    const data = (await response.json());
    if (data.base !== "INR" ||
        data.quote !== "USD" ||
        typeof data.rate !== "number" ||
        !Number.isFinite(data.rate) ||
        data.rate <= 0 ||
        typeof data.date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
        throw new Error("INVALID_EXCHANGE_RATE_RESPONSE");
    }
    return {
        base: "INR",
        quote: "USD",
        rate: data.rate,
        date: data.date,
        provider: "Frankfurter",
    };
};
export const convertInrToUsd = (inrAmount, exchangeRate) => {
    if (!Number.isFinite(inrAmount) ||
        inrAmount <= 0 ||
        !Number.isFinite(exchangeRate) ||
        exchangeRate <= 0) {
        throw new Error("INVALID_CONVERSION_AMOUNT");
    }
    const usdCents = Math.round(inrAmount * exchangeRate * 100);
    if (usdCents <= 0) {
        throw new Error("CONVERTED_AMOUNT_TOO_SMALL");
    }
    return (usdCents / 100).toFixed(2);
};
//# sourceMappingURL=exchange-rate.service.js.map