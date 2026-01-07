import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, MapPin, Phone, Mail, Info, Share2 } from "lucide-react";
import contactBanner from "../../assets/images/contactbanner.png";
import facebookIcon from "../../assets/images/facebook.svg";
import whatsappIcon from "../../assets/images/whatsapp.svg";
import instagramIcon from "../../assets/images/instagram.svg";
import { submitContact } from "../../utils/contactService";
import { toast } from "react-toastify";

const Contact = () => {
  const MESSAGE_MAX_LENGTH = 1000; // Character limit for message field (supports English, Tamil, German)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    recipient: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedFields, setFocusedFields] = useState({
    fullName: false,
    email: false,
    recipient: false,
    message: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For message field, enforce character limit
    if (name === "message" && value.length > MESSAGE_MAX_LENGTH) {
      return; // Don't update if exceeds limit
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedFields((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  };

  const handleBlur = (fieldName) => {
    setFocusedFields((prev) => ({
      ...prev,
      [fieldName]: false,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "முழுப்பெயர் தேவையானது";
    }

    if (!formData.email.trim()) {
      newErrors.email = "மின்னஞ்சல் தேவையானது";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "செல்லுபடியான மின்னஞ்சல் முகவரியை உள்ளிடவும்";
    }

    if (!formData.recipient.trim()) {
      newErrors.recipient = "பெறுபவர் தேவையானது";
    }

    if (!formData.message.trim()) {
      newErrors.message = "தகவல் தேவையானது";
    } else if (formData.message.length > MESSAGE_MAX_LENGTH) {
      newErrors.message = `தகவல் ${MESSAGE_MAX_LENGTH} எழுத்துக்களுக்கு மேல் இருக்கக்கூடாது`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        recipient: formData.recipient.trim(),
        message: formData.message.trim(),
      };

      const response = await submitContact(payload);

      if (response.success) {
        // Reset form on success
        setFormData({
          fullName: "",
          email: "",
          recipient: "",
          message: "",
        });
        // Reset focused fields
        setFocusedFields({
          fullName: false,
          email: false,
          recipient: false,
          message: false,
        });
        toast.success("உங்கள் செய்தி வெற்றிகரமாக அனுப்பப்பட்டது!");
      } else {
        toast.error(
          response.error ||
            "பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#F6F6F9] py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="px-4 py-3 mb-6">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="flex items-center gap-1 text-black hover:text-[#FF0000] transition-colors"
            >
              <Home className="w-4 h-4 text-[#FF0000] stroke-2 fill-none" />
              <span className="text-black">இல்லம்</span>
            </Link>
            <span className="text-black">{">"}</span>
            <span className="text-[#FF0000] font-[400]">தொடர்புகள்</span>
          </nav>
        </div>

        {/* Page Title */}
        <h1 className="text-[30px] font-[700] text-black mb-8">தொடர்புகள்</h1>

        {/* Banner Image */}
        <div className="mb-8 rounded-xl overflow-hidden">
          <img
            src={contactBanner}
            alt="Contact Banner"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Contact Information and Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Contact Information */}
          <div className="bg-white rounded-2xl p-6 md:p-8">
            {/* Office Address */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#FFE8E8" }}
                >
                  <MapPin className="w-5 h-5 text-[#FF0000] stroke-2" />
                </div>
                <h3 className="text-[16px] font-[400] text-[#737373]">
                  அலுவலக முகவரி:
                </h3>
              </div>
              <p className="text-[16px] text-[#1D1D1D] ml-14">
                Bern Postfach 9630
              </p>
            </div>

            {/* IBAN & Email */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#FFE8E8" }}
                >
                  <Info className="w-5 h-5 text-[#FF0000] stroke-2" />
                </div>
                <h3 className="text-[16px] font-[400] text-[#737373]">
                  அமைப்பு தகவல்:
                </h3>
              </div>
              <div className="ml-14 text-[16px] text-[#1D1D1D]">
                <p className="mb-1">IBAN: CH85 0900 0000 1654 6975 2</p>
                <p className="mb-1">2009 - 2025</p>
                <p className="flex items-center gap-4">
                  {/* <Mail className="w-4 h-4 text-[#FF0000]" /> */}
                  <span>info@tccswiss.org</span>
                </p>
              </div>
            </div>

            {/* Contact Numbers */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#FFE8E8" }}
                >
                  <Phone className="w-5 h-5 text-[#FF0000] stroke-2" />
                </div>
                <h3 className="text-[16px] font-[400] text-[#737373]">
                  தொடர்பு எண்கள்:
                </h3>
              </div>
              <div className="ml-14 space-y-2">
                <p className="text-[16px] text-[#1D1D1D]">079 768 91 25</p>
                <p className="text-[16px] text-[#1D1D1D]">079 377 16 40</p>
                <p className="text-[16px] text-[#1D1D1D]">079 549 89 21</p>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#FFE8E8" }}
                >
                  <Share2 className="w-5 h-5 text-[#FF0000] stroke-2" />
                </div>
                <h3 className="text-[16px] font-[400] text-[#737373]">
                  சமூகம்
                </h3>
              </div>
              <div className="ml-14 flex items-center gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61585608749142"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img src={facebookIcon} alt="Facebook" className="w-8 h-8" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img src={whatsappIcon} alt="WhatsApp" className="w-8 h-8" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img
                    src={instagramIcon}
                    alt="Instagram"
                    className="w-8 h-8"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-white rounded-2xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="relative">
                {(focusedFields.fullName || formData.fullName) && (
                  <label
                    htmlFor="fullName"
                    className="absolute left-5 -top-2.5 bg-white px-2 text-[14px] font-[400] text-gray-700 z-10"
                  >
                    முழுப்பெயர்<span className="text-[#FF0000]">*</span>
                  </label>
                )}
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onFocus={() => handleFocus("fullName")}
                  onBlur={() => handleBlur("fullName")}
                  required
                  className={`w-full px-5 py-4 rounded-2xl border bg-white text-gray-900 ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent text-[16px] placeholder:text-gray-500`}
                  placeholder="முழுப்பெயர்*"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="relative">
                {(focusedFields.email || formData.email) && (
                  <label
                    htmlFor="email"
                    className="absolute left-5 -top-2.5 bg-white px-2 text-[14px] font-[400] text-gray-700 z-10"
                  >
                    மின்னஞ்சல்<span className="text-[#FF0000]">*</span>
                  </label>
                )}
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus("email")}
                  onBlur={() => handleBlur("email")}
                  required
                  className={`w-full px-5 py-4 rounded-2xl border bg-white text-gray-900 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent text-[16px] placeholder:text-gray-500`}
                  placeholder="மின்னஞ்சல்*"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Recipient */}
              <div className="relative">
                {(focusedFields.recipient || formData.recipient) && (
                  <label
                    htmlFor="recipient"
                    className="absolute left-5 -top-2.5 bg-white px-2 text-[14px] font-[400] text-gray-700 z-10"
                  >
                    பெறுபவர்<span className="text-[#FF0000]">*</span>
                  </label>
                )}
                <input
                  type="text"
                  id="recipient"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleChange}
                  onFocus={() => handleFocus("recipient")}
                  onBlur={() => handleBlur("recipient")}
                  required
                  className={`w-full px-5 py-4 rounded-2xl border bg-white text-gray-900 ${
                    errors.recipient ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent text-[16px] placeholder:text-gray-500`}
                  placeholder="பெறுபவர்*"
                />
                {errors.recipient && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.recipient}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="relative">
                {(focusedFields.message || formData.message) && (
                  <label
                    htmlFor="message"
                    className="absolute left-5 -top-2.5 bg-white px-2 text-[14px] font-[400] text-gray-700 z-10"
                  >
                    தகவல்<span className="text-[#FF0000]">*</span>
                  </label>
                )}
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => handleFocus("message")}
                  onBlur={() => handleBlur("message")}
                  required
                  maxLength={MESSAGE_MAX_LENGTH}
                  rows={6}
                  className={`w-full px-5 py-4 rounded-2xl border bg-white text-gray-900 ${
                    errors.message ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent text-[16px] resize-none placeholder:text-gray-500`}
                  placeholder="தகவல்*"
                />
                <div className="flex items-center justify-between mt-2">
                  {errors.message ? (
                    <p className="text-sm text-red-500">{errors.message}</p>
                  ) : (
                    <div></div>
                  )}
                  <p
                    className={`text-sm ${
                      formData.message.length > MESSAGE_MAX_LENGTH * 0.9
                        ? "text-red-500"
                        : formData.message.length > MESSAGE_MAX_LENGTH * 0.75
                        ? "text-orange-500"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.message.length} / {MESSAGE_MAX_LENGTH}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FF0000] text-white py-4 rounded-2xl text-[16px] font-[600] hover:bg-[#E60000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "அனுப்புகிறது..." : "அனுப்புக"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
