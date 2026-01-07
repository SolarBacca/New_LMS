export const useUser = () => {
    return useState<{ id: number; name: string; role: string } | null>(
        "user",
        () => null
    );
};
