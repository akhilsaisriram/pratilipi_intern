exports.validatedata = (data, isUpdate = false) => {
    const errors = [];

    if (!isUpdate || data.productname !== undefined) {
        if (!data.productname || typeof data.productname !== 'string') {
            errors.push('Valid product name is required.');
        }
    }

    if (!isUpdate || data.description !== undefined) {
        if (!data.description || typeof data.description !== 'string') {
            errors.push('Valid description is required.');
        }
    }

    if (!isUpdate || data.price !== undefined) {
        if (isNaN(data.price) || data.price < 0) {
            errors.push('Price must be a positive number.');
        }
    }

    if (!isUpdate || data.unitsavailable !== undefined) {
        if (isNaN(data.unitsavailable) || data.unitsavailable < 0) {
            errors.push('Number of units available must be a positive number.');
        }
    }

    if (!isUpdate || data.category !== undefined) {
        if (!data.category || typeof data.category !== 'string') {
            errors.push('Category is required.');
        }
    }

    if (!isUpdate || data.subcategory !== undefined) {
        if (!data.subcategory || typeof data.subcategory !== 'string') {
            errors.push('Subcategory is required.');
        }
    }

    if (!isUpdate || data.company !== undefined) {
        if (!data.company || typeof data.company !== 'string') {
            errors.push('Company is required.');
        }
    }

    if (data.reviews !== undefined) {
        if (!Array.isArray(data.reviews)) {
            errors.push('Reviews must be an array.');
        } else {
            data.reviews.forEach((review, index) => {
                if (review.username !== undefined && typeof review.username !== 'string') {
                    errors.push(`Review at index ${index} must have a valid username.`);
                }
                if (review.userid !== undefined && typeof review.userid !== 'string') {
                    errors.push(`Review at index ${index} must have a valid userid.`);
                }
                if (review.message !== undefined && typeof review.message !== 'string') {
                    errors.push(`Review at index ${index} must have a valid message.`);
                }
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
