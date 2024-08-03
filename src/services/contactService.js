import pool from '../database/db.js';

export const identifyAndConsolidate = async (email, phoneNumber) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let primaryContact = await findPrimaryContact(client, email, phoneNumber);

    if (!primaryContact) {
      primaryContact = await createNewPrimaryContact(client, email, phoneNumber);
    } else {
      await createOrUpdateSecondaryContact(client, primaryContact, email, phoneNumber);
    }

    const consolidatedContact = await getConsolidatedContact(client, primaryContact.id);

    await client.query('COMMIT');
    return consolidatedContact;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const findPrimaryContact = async (client, email, phoneNumber) => {
  const result = await client.query(
    `SELECT * FROM contacts 
    WHERE (email = $1 OR phone_number = $2) 
    AND link_precedence = 'primary' 
    ORDER BY created_at ASC 
    LIMIT 1`,
    [email, phoneNumber]
  );
  return result.rows[0];
};

const createNewPrimaryContact = async (client, email, phoneNumber) => {
  const result = await client.query(
    `INSERT INTO contacts (email, phone_number, link_precedence) 
    VALUES ($1, $2, 'primary') 
    RETURNING *`,
    [email, phoneNumber]
  );
  return result.rows[0];
};

const createOrUpdateSecondaryContact = async (client, primaryContact, email, phoneNumber) => {
  const existingSecondary = await client.query(
    `SELECT * FROM contacts 
    WHERE (email = $1 OR phone_number = $2) 
    AND id != $3 
    LIMIT 1`,
    [email, phoneNumber, primaryContact.id]
  );

  if (existingSecondary.rows[0]) {
    if (existingSecondary.rows[0].link_precedence === 'primary') {
      await client.query(
        `UPDATE contacts 
        SET linked_id = $1, link_precedence = 'secondary', updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2`,
        [primaryContact.id, existingSecondary.rows[0].id]
      );
    }
  } else if (email !== primaryContact.email || phoneNumber !== primaryContact.phone_number) {
    await client.query(
      `INSERT INTO contacts (email, phone_number, linked_id, link_precedence) 
      VALUES ($1, $2, $3, 'secondary')`,
      [
        email !== primaryContact.email ? email : null,
        phoneNumber !== primaryContact.phone_number ? phoneNumber : null,
        primaryContact.id
      ]
    );
  }
};

const getConsolidatedContact = async (client, primaryId) => {
  const result = await client.query(
    `SELECT * FROM contacts 
    WHERE id = $1 OR linked_id = $1 
    ORDER BY created_at ASC`,
    [primaryId]
  );

  const contacts = result.rows;
  const primaryContact = contacts.find(c => c.link_precedence === 'primary');
  const secondaryContacts = contacts.filter(c => c.link_precedence === 'secondary');

  return {
    primaryContactId: primaryContact.id,
    emails: [...new Set(contacts.map(c => c.email).filter(Boolean))],
    phoneNumbers: [...new Set(contacts.map(c => c.phone_number).filter(Boolean))],
    secondaryContactIds: secondaryContacts.map(c => c.id)
  };
};