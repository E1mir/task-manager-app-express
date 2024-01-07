/**
 * Convert a size value from a specified unit to bytes.
 *
 * @param {number} size - The size value to convert.
 * @param {string} unit - The unit of the size (kb, mb, gb).
 * @returns {number} The size converted to bytes.
 * @throws {Error} Throws an error if an invalid unit is provided.
 *
 * @example
 * // Convert 5 MB to bytes
 * const sizeInBytes = getBytes(5, 'MB');
 * console.log(sizeInBytes); // Output: 5242880
 */
const getBytes = (size, unit) => {
  const unitLowerCase = unit.toLowerCase();
  const unitFactors = {
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  if (unitFactors.hasOwnProperty(unitLowerCase)) {
    return size * unitFactors[unitLowerCase];
  } else {
    throw new Error('Invalid unit');
  }
};


/**
 * Creates a file filter function for use with multer middleware.
 *
 * If the array of allowed extensions is empty, the filter allows all extensions.
 *
 * @param {string[]} [allowedExtensions=[]] - An array of allowed file extensions.
 * @returns {function} A file filter function compatible with multer.
 *
 * @throws {Error} - Throws an error if the file has an invalid extension.
 */
const createFileFilter = (allowedExtensions = []) => {
  return (req, file, cb) => {
    if (allowedExtensions.length === 0) {
      // Allow all extensions if the array is empty
      cb(null, true);
    } else {
      const fileType = file.originalname.split('.').pop().toLowerCase();
      if (allowedExtensions.includes(fileType)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`));
      }
    }
  };
};

module.exports = {
  getBytes,
  createFileFilter
}
