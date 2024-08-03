import * as contactService from '../services/contactService.js';

export const identify = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    const result = await contactService.identifyAndConsolidate(email, phoneNumber);
    res.json({ contact: result });
  } catch (error) {
    console.error('Error in identify controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};