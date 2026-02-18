const supabase = require("../config/supabaseClient");

const TABLE = "products";

// READ ALL
const getAllProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// READ ONE
const getProductById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (error) throw error;
    if (!data)
      return res.status(404).json({ success: false, message: "ไม่พบสินค้า" });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE
const createProduct = async (req, res) => {
  try {
    const { name, category, brand, price, stock, description } = req.body;
    if (!name || !price)
      return res
        .status(400)
        .json({ success: false, message: "กรุณากรอกชื่อสินค้าและราคา" });

    const { data, error } = await supabase
      .from(TABLE)
      .insert([
        {
          name,
          category,
          brand,
          price: parseFloat(price),
          stock: parseInt(stock) || 0,
          description,
        },
      ])
      .select();
    if (error) throw error;
    res
      .status(201)
      .json({ success: true, message: "เพิ่มสินค้าสำเร็จ", data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
const updateProduct = async (req, res) => {
  try {
    const { name, category, brand, price, stock, description } = req.body;
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        name,
        category,
        brand,
        price: parseFloat(price),
        stock: parseInt(stock),
        description,
      })
      .eq("id", req.params.id)
      .select();
    if (error) throw error;
    if (!data?.length)
      return res.status(404).json({ success: false, message: "ไม่พบสินค้า" });
    res.json({ success: true, message: "แก้ไขสินค้าสำเร็จ", data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
const deleteProduct = async (req, res) => {
  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true, message: "ลบสินค้าสำเร็จ" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
