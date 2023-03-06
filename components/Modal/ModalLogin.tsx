import { useDisclosure } from '@mantine/hooks';
import { Group, Modal, Button, TextInput, Space } from '@mantine/core';
import { useForm } from '@mantine/form';
import { LoginProps } from '../../lib/types';
import { useEffect, useState } from 'react';

export default function ModalLogin() {
  const [opened, { open, close }] = useDisclosure(false);
  const [cookies, setCookies] = useState<any>();
  const form = useForm({
    initialValues: {
      id: '',
      password: '',
    },
  });
  const fetchCookies = async (loginInfo: LoginProps) => {
    return await fetch('http://localhost:3000/api/cookies', {
      method: 'POST',
      body: JSON.stringify(loginInfo),
    });
  };
  useEffect(() => {
    console.log(cookies);
  }, [cookies]);
  return (
    <>
      <Modal opened={opened} onClose={close} title="Authentication" centered withCloseButton>
        <form
          onSubmit={form.onSubmit((values: LoginProps) => {
            console.log(values);
            fetchCookies(values).then((response) => {
              setCookies(response.json());
            });
          })}
        >
          <TextInput label="ID" placeholder="Your portal id" {...form.getInputProps('id')} />
          <Space h={20} />
          <TextInput
            label="Password"
            placeholder="Your portal password"
            {...form.getInputProps('password')}
          />
          <Button type="submit" mt="md">
            Submit
          </Button>
        </form>
      </Modal>
      <Group position="center">
        <Button onClick={open}>Portal Login</Button>
      </Group>
    </>
  );
}
