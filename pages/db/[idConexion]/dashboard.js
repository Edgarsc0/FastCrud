
import { Heading, Text, Separator, Badge, Strong, Grid, Card, Box, Table, Flex, Button, Dialog, Inset } from "@radix-ui/themes";
import axios from "axios";

export default function ({ idConexion, descripciones, dbName }) {
    return <>
        <Heading className="p-5" color="cyan">
            Conexion: {dbName}
        </Heading>
        <Text className="mx-5" size="3">Identificador de la conexion: <Strong>{idConexion}</Strong></Text>
        <Separator my="3" size="4" />
        <Grid columns="3" gap="3" width="auto" className="p-8">
            {descripciones ? (
                <>
                    {descripciones.map((tabla) => (

                        <Box key={tabla.name}>
                            <Card>
                                <Badge color="blue" className="mb-2">Tabla</Badge>
                                <div className="flex justify-between">
                                    <Heading>
                                        {tabla.name}
                                    </Heading>
                                    <Dialog.Root>
                                        <Dialog.Trigger>
                                            <Button variant="soft">Show table info</Button>
                                        </Dialog.Trigger>
                                        <Dialog.Content>
                                            <Dialog.Title color="cyan">{tabla.name}</Dialog.Title>
                                            <Dialog.Description>
                                                La tabla contiene los siguientes campos:
                                            </Dialog.Description>

                                            <Inset side="x" my="5">
                                                <Table.Root>
                                                    <Table.Header>
                                                        <Table.Row>
                                                            <Table.ColumnHeaderCell>
                                                                <Text color="cyan">
                                                                    Field
                                                                </Text>
                                                            </Table.ColumnHeaderCell>
                                                            <Table.ColumnHeaderCell>
                                                                <Text color="cyan">
                                                                    Type
                                                                </Text>
                                                            </Table.ColumnHeaderCell>
                                                            <Table.ColumnHeaderCell>
                                                                <Text color="cyan">
                                                                    Null
                                                                </Text>
                                                            </Table.ColumnHeaderCell>
                                                        </Table.Row>
                                                    </Table.Header>

                                                    <Table.Body>
                                                        {tabla.fields.map(campo => (
                                                            <Table.Row key={campo.Field}>

                                                                <Table.RowHeaderCell>
                                                                    {campo.Field}
                                                                </Table.RowHeaderCell>
                                                                <Table.Cell>
                                                                    {campo.Type}
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    {campo.Null == "NO" ? ("NO") : "YES"}
                                                                </Table.Cell>
                                                            </Table.Row>
                                                        ))}
                                                    </Table.Body>
                                                </Table.Root>
                                            </Inset>

                                            <Flex gap="3" justify="end">
                                                <Dialog.Close>
                                                    <Button variant="soft" color="blue">
                                                        Close
                                                    </Button>
                                                </Dialog.Close>
                                            </Flex>
                                        </Dialog.Content>
                                    </Dialog.Root>
                                </div>
                                <Separator my="3" size="4" />
                                <Text size="3">
                                    Count of fields: <Strong>{tabla.fields.length}</Strong>
                                </Text>
                                <Flex gapX="2" className="my-2">
                                    <Badge color="cyan">GET</Badge>
                                    <Badge color="indigo">POST</Badge>
                                    <Badge color="orange">PATCH</Badge>
                                    <Badge color="crimson">DELETE</Badge>
                                </Flex>
                                <Text>
                                    {`/api/db/:idConexion/${tabla.name}`}

                                </Text>
                            </Card>
                        </Box>
                    ))}
                </>
            ) : null}
        </Grid>
    </>
}

export async function getStaticProps(ctx) {
    const idConexion = ctx.params.idConexion;
    const infoTables = await axios.post("/api/fastcrud/showTables", {
        idConexion
    });
    const promises = infoTables.data.tablas.map(async (tabla) => {
        const info = await axios.post("/api/fastcrud/getTableInfo", {
            idConexion,
            tabla
        });
        return tabla = {
            name: tabla,
            fields: info.data.rows
        };
    })
    const descripciones = await Promise.all(promises);
    return {
        props: {
            idConexion,
            descripciones,
            dbName: infoTables.data.DBNAME,
        }
    }
}

export async function getStaticPaths() {
    const { data } = await axios.get("/api/fastcrud/getAllConections");
    const { idConections } = data;
    const paths = idConections.map((id) => ({
        params: {
            idConexion: id.idConexion
        }
    }));

    return {
        paths,
        fallback: false
    };
}