import * as yup from "yup";

export const profileSchema = yup.object().shape({
	firstName: yup.string().required("Required"),
	lastName: yup.string().required("Required"),
	email: yup.string().email().required("Required"),
	gender: yup.string().oneOf(["male", "female"]),
	dateOfBirth: yup.string(),
});
