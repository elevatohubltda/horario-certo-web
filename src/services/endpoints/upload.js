import api from "../api";

export const uploadLogo = (companyUrl, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.post(`/upload?${params}`,
        formData, 
        { 
            withAuth: true,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
};